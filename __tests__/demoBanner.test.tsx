import { render, screen, waitFor } from "@testing-library/react-native";
import { DemoBanner } from "../src/components/DemoBanner";

const health = (demo: boolean) => jest.fn(async () => ({ status: 200, ok: true, json: async () => ({ status: "ok", demo }) }));

it("exibe o aviso quando a API indica demo", async () => {
  global.fetch = health(true) as unknown as typeof fetch;
  render(<DemoBanner />);
  await waitFor(() => expect(screen.getByText("Ambiente de demonstração")).toBeTruthy());
});

it("não exibe fora de demo", async () => {
  const f = health(false);
  global.fetch = f as unknown as typeof fetch;
  render(<DemoBanner />);
  await waitFor(() => expect(f).toHaveBeenCalled());
  expect(screen.queryByText("Ambiente de demonstração")).toBeNull();
});
