"use client";

import { Flex, Text } from "@radix-ui/themes";
import { CheckIcon } from "@radix-ui/react-icons";

export type StepKey = "details" | "payment" | "receipt" | "done";

export function CheckoutSteps({
  current,
  labels,
}: {
  current: StepKey;
  labels: Record<StepKey, string>;
}) {
  const order: StepKey[] = ["details", "payment", "receipt", "done"];
  const currentIndex = order.indexOf(current);

  return (
    <Flex align="center" gap="2" wrap="wrap" mb="5">
      {order.map((key, index) => {
        const isDone = index < currentIndex;
        const isActive = index === currentIndex;
        return (
          <Flex key={key} align="center" gap="2">
            <Flex
              align="center"
              justify="center"
              style={{
                width: 28,
                height: 28,
                borderRadius: "999px",
                fontSize: 13,
                fontWeight: 600,
                background: isDone || isActive ? "var(--accent-9)" : "var(--gray-a4)",
                color: isDone || isActive ? "white" : "var(--gray-11)",
              }}
            >
              {isDone ? <CheckIcon /> : index + 1}
            </Flex>
            <Text size="2" weight={isActive ? "bold" : "regular"} color={isActive ? undefined : "gray"}>
              {labels[key]}
            </Text>
            {index < order.length - 1 && (
              <Text color="gray" mx="1">
                —
              </Text>
            )}
          </Flex>
        );
      })}
    </Flex>
  );
}
