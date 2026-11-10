import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import TrocarUnidade from "../app/(app)/trocar-unidade";
import type { MyUnit } from "../src/api/client";

const mockUnits = jest.fn();
const mockSetActiveUnit = jest.fn();
const mockBack = jest.fn();
const mockUseAuth = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack, push: jest.fn(), replace: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));

jest.mock("../src/api/client", () => ({
  api: {
    profile: {
      units: (...args: unknown[]) => mockUnits(...args),
    },
  },
}));

jest.mock("../src/auth/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

const unit101: MyUnit = {
  linkId: "link-1",
  unitId: "unit-1",
  unitNumber: "101",
  blockName: "Torre A",
  kind: "proprietario",
  startsOn: "2024-01-01",
  active: true,
  canManageHousehold: true,
};

const unit202: MyUnit = {
  linkId: "link-2",
  unitId: "unit-2",
  unitNumber: "202",
  kind: "morador",
  startsOn: "2024-01-01",
  active: true,
  canManageHousehold: false,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({
    activeUnit: unit101,
    setActiveUnit: mockSetActiveUnit,
    user: null,
    status: "signedIn",
    signIn: jest.fn(),
    signOut: jest.fn(),
  });
});

it("exibe as unidades carregadas da API", async () => {
  mockUnits.mockResolvedValueOnce({ items: [unit101, unit202] });

  await render(<TrocarUnidade />);

  await waitFor(() => expect(screen.getByText(/Torre A/)).toBeTruthy());
  expect(screen.getByText(/Unidade 202/)).toBeTruthy();
});

it("chama setActiveUnit e volta ao selecionar uma unidade", async () => {
  mockSetActiveUnit.mockResolvedValueOnce(undefined);
  mockUnits.mockResolvedValueOnce({ items: [unit101, unit202] });

  render(<TrocarUnidade />);

  await waitFor(() => expect(screen.getByText(/Unidade 202/)).toBeTruthy());
  fireEvent.press(screen.getByRole("button", { name: /Selecionar.*Unidade 202/ }));

  await waitFor(() => expect(mockSetActiveUnit).toHaveBeenCalledWith(unit202));
  await waitFor(() => expect(mockBack).toHaveBeenCalled());
});

it("marca a unidade ativa visualmente", async () => {
  mockUnits.mockResolvedValueOnce({ items: [unit101, unit202] });

  render(<TrocarUnidade />);

  await waitFor(() => expect(screen.getByText("Ativa")).toBeTruthy());
});

it("mostra mensagem de erro quando a API falha", async () => {
  mockUnits.mockRejectedValueOnce(new Error("network"));

  render(<TrocarUnidade />);

  await waitFor(() =>
    expect(screen.getByText("Não foi possível carregar as unidades.")).toBeTruthy(),
  );
});

it("mostra loading enquanto busca", async () => {
  mockUnits.mockReturnValueOnce(new Promise(() => {})); // never resolves

  await render(<TrocarUnidade />);

  await waitFor(() => expect(screen.getByText("Carregando…")).toBeTruthy());
});
