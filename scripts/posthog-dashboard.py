#!/usr/bin/env python3
"""
Cria no PostHog o dashboard "App Firula" com os gráficos dos eventos do app
(catálogo em src/analytics/events.ts).

Uso:
    yarn posthog:dashboard            # pergunta região, ID do projeto e chave pessoal
    yarn posthog:dashboard --dry-run  # só mostra o que seria criado, sem chamar a API

Também lê as variáveis POSTHOG_REGION (us|eu), POSTHOG_PROJECT_ID e POSTHOG_PERSONAL_API_KEY,
se existirem. A chave pessoal (phx_...) é criada em Settings → Personal API keys, com as
permissões dashboard:write e insight:write. Ela NÃO é a chave phc_ do .env.production.

Se o dashboard já existir, o script não duplica: mostra o link e para.
"""

import getpass
import json
import os
import sys
import urllib.error
import urllib.request

DASHBOARD_NAME = "App Firula"
DASHBOARD_DESCRIPTION = "Funil de compra e uso do app (eventos de src/analytics/events.ts)"


def events(*names):
    return [{"kind": "EventsNode", "event": name, "name": name} for name in names]


def trends(series, date_from="-30d", interval="day", breakdown=None, display=None):
    source = {"kind": "TrendsQuery", "series": series, "interval": interval, "dateRange": {"date_from": date_from}}
    if breakdown:
        source["breakdownFilter"] = {"breakdown": breakdown, "breakdown_type": "event"}
    if display:
        source["trendsFilter"] = {"display": display}
    return {"kind": "InsightVizNode", "source": source}


INSIGHTS = [
    {
        "name": "Funil de compra (30 dias)",
        "description": "Evento visto → checkout aberto → compra concluída, em até 1 dia.",
        "query": {
            "kind": "InsightVizNode",
            "source": {
                "kind": "FunnelsQuery",
                "series": events("event_viewed", "checkout_started", "purchase_completed"),
                "funnelsFilter": {"funnelWindowInterval": 1, "funnelWindowIntervalUnit": "day"},
                "dateRange": {"date_from": "-30d"},
            },
        },
    },
    {
        "name": "Receita por dia (R$)",
        "description": "Soma de revenue das compras concluídas.",
        "query": trends(
            [{"kind": "EventsNode", "event": "purchase_completed", "name": "purchase_completed", "math": "sum", "math_property": "revenue"}]
        ),
    },
    {
        "name": "Compras por forma de pagamento",
        "description": "FREE, PIX ou CARD.",
        "query": trends(events("purchase_completed"), breakdown="payment_method"),
    },
    {
        "name": "Falhas na compra",
        "description": "Compras recusadas ou com erro, por mensagem.",
        "query": trends(events("purchase_failed"), breakdown="error_message", display="ActionsBarValue"),
    },
    {
        "name": "Usuários ativos por dia",
        "description": "Pessoas únicas que abriram alguma tela.",
        "query": trends([{"kind": "EventsNode", "event": "$screen", "name": "$screen", "math": "dau"}]),
    },
    {
        "name": "Telas mais vistas",
        "query": trends(events("$screen"), breakdown="$screen_name", display="ActionsBarValue"),
    },
    {
        "name": "Logins por método",
        "query": trends(events("login_completed"), date_from="-90d", interval="week", breakdown="method"),
    },
    {
        "name": "Cadastros por semana",
        "query": trends(events("signup_completed"), date_from="-90d", interval="week"),
    },
    {
        "name": "Uso dos ingressos",
        "description": "QR Code aberto e cliques em adicionar à carteira.",
        "query": trends(events("ticket_qr_opened", "ticket_wallet_add_clicked")),
    },
]


def ask(env_name, prompt, secret=False, default=None):
    value = os.environ.get(env_name, "").strip()
    if value:
        return value
    suffix = f" [{default}]" if default else ""
    reader = getpass.getpass if secret else input
    value = reader(f"{prompt}{suffix}: ").strip()
    return value or (default or "")


class Api:
    def __init__(self, host, project_id, key):
        self.base = f"{host}/api/projects/{project_id}"
        self.key = key

    def request(self, method, path, body=None):
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(
            f"{self.base}/{path}",
            data=data,
            method=method,
            headers={"Authorization": f"Bearer {self.key}", "Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read() or b"{}")
        except urllib.error.HTTPError as err:
            detail = err.read().decode(errors="replace")[:500]
            hints = {
                401: "chave inválida — use a chave PESSOAL (phx_), não a phc_ do app.",
                403: "a chave não tem as permissões dashboard:write e insight:write, ou não acessa este projeto.",
                404: "projeto não encontrado — confira o ID do projeto e a região (us/eu).",
            }
            hint = hints.get(err.code, "")
            sys.exit(f"\n✗ PostHog respondeu {err.code} em {method} {path}\n  {hint}\n  {detail}")
        except urllib.error.URLError as err:
            sys.exit(f"\n✗ Não foi possível falar com o PostHog: {err.reason}")


def main():
    dry_run = "--dry-run" in sys.argv

    if dry_run:
        print(f'Dashboard "{DASHBOARD_NAME}" com {len(INSIGHTS)} gráficos:')
        for insight in INSIGHTS:
            json.dumps(insight)  # garante que o payload é JSON válido
            print(f"  - {insight['name']}")
        print("\nNada foi enviado (--dry-run).")
        return

    region = ask("POSTHOG_REGION", "Região do PostHog (us ou eu)", default="us").lower()
    if region not in ("us", "eu"):
        sys.exit("✗ Região deve ser us ou eu.")
    host = f"https://{region}.posthog.com"
    project_id = ask("POSTHOG_PROJECT_ID", "ID do projeto (Settings → Project)")
    if not project_id.isdigit():
        sys.exit("✗ O ID do projeto é um número (ex.: 12345).")
    key = ask("POSTHOG_PERSONAL_API_KEY", "Chave pessoal phx_ (não aparece ao digitar)", secret=True)
    if not key.startswith("phx_"):
        sys.exit("✗ Use a chave pessoal, que começa com phx_ (a phc_ do app não cria dashboards).")

    api = Api(host, project_id, key)

    existing = api.request("GET", "dashboards/?limit=200")
    for dash in existing.get("results", []):
        if dash.get("name") == DASHBOARD_NAME and not dash.get("deleted"):
            print(f'Já existe um dashboard "{DASHBOARD_NAME}": {host}/project/{project_id}/dashboard/{dash["id"]}')
            print("Nada foi criado. Para recriar, apague ou renomeie o atual no PostHog e rode de novo.")
            return

    dashboard = api.request("POST", "dashboards/", {"name": DASHBOARD_NAME, "description": DASHBOARD_DESCRIPTION})
    dash_id = dashboard["id"]
    print(f'✓ Dashboard "{DASHBOARD_NAME}" criado')

    for insight in INSIGHTS:
        api.request("POST", "insights/", {**insight, "dashboards": [dash_id]})
        print(f"  ✓ {insight['name']}")

    print(f"\nPronto: {host}/project/{project_id}/dashboard/{dash_id}")
    print("Os gráficos ficam vazios até o app publicado com EXPO_PUBLIC_POSTHOG_KEY começar a enviar eventos.")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit("\nCancelado.")
