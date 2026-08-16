import React, { useMemo } from "react";
import { View, type TextStyle } from "react-native";

import { Text } from "@/design-system";
import { parseRichText, type RichNode } from "@/utils/parseRichText";

function renderInline(nodes: RichNode[], keyPrefix: string): React.ReactNode {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;

    if (node.type === "text") {
      return node.value;
    }
    if (node.tag === "br") {
      return "\n";
    }

    const style: TextStyle = {};
    if (node.tag === "strong") style.fontWeight = "700";
    if (node.tag === "em") style.fontStyle = "italic";
    if (node.tag === "u") style.textDecorationLine = "underline";
    if (node.tag === "s") style.textDecorationLine = "line-through";
    if (node.style?.color) style.color = node.style.color;
    if (node.style?.fontSize) style.fontSize = node.style.fontSize;

    return (
      <Text key={key} style={style}>
        {renderInline(node.children, key)}
      </Text>
    );
  });
}

function renderBlock(node: RichNode, index: number): React.ReactNode {
  if (node.type === "text") {
    return (
      <Text key={index} token="body" color="muted" style={{ lineHeight: 22, marginBottom: 8 }}>
        {node.value}
      </Text>
    );
  }

  switch (node.tag) {
    case "p": {
      const inlineStyle: TextStyle = {};
      if (node.style?.color) inlineStyle.color = node.style.color;
      if (node.style?.fontSize) inlineStyle.fontSize = node.style.fontSize;
      return (
        <Text
          key={index}
          token="body"
          color="muted"
          style={[{ lineHeight: 22, marginBottom: 8 }, inlineStyle]}
        >
          {renderInline(node.children, `p-${index}`)}
        </Text>
      );
    }

    case "h2":
      return (
        <Text key={index} token="subtitle" style={{ fontWeight: "800", marginTop: 4, marginBottom: 8 }}>
          {renderInline(node.children, `h2-${index}`)}
        </Text>
      );

    case "h3":
      return (
        <Text key={index} token="body" style={{ fontWeight: "800", marginTop: 4, marginBottom: 6 }}>
          {renderInline(node.children, `h3-${index}`)}
        </Text>
      );

    case "ul":
    case "ol": {
      const items = node.children.filter(
        (child): child is Extract<RichNode, { type: "element" }> =>
          child.type === "element" && child.tag === "li",
      );
      return (
        <View key={index} style={{ marginBottom: 8, gap: 4 }}>
          {items.map((item, itemIndex) => (
            <View key={itemIndex} style={{ flexDirection: "row", gap: 8 }}>
              <Text token="body" color="muted" style={{ lineHeight: 22 }}>
                {node.tag === "ol" ? `${itemIndex + 1}.` : "•"}
              </Text>
              <Text token="body" color="muted" style={{ lineHeight: 22, flex: 1 }}>
                {renderInline(item.children, `li-${index}-${itemIndex}`)}
              </Text>
            </View>
          ))}
        </View>
      );
    }

    default:
      // Tag fora da allowlist não deveria chegar aqui (já filtrada pelo sanitizador do
      // backend) — renderiza só o conteúdo interno como parágrafo, sem quebrar a tela.
      return (
        <Text key={index} token="body" color="muted" style={{ lineHeight: 22, marginBottom: 8 }}>
          {renderInline(node.children, `unknown-${index}`)}
        </Text>
      );
  }
}

export function RichText({ html }: { html: string }) {
  const nodes = useMemo(() => parseRichText(html), [html]);
  return <>{nodes.map((node, index) => renderBlock(node, index))}</>;
}
