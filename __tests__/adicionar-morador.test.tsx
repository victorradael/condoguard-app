import { fireEvent, render, screen, userEvent, waitFor } from "@testing-library/react-native";
import AdicionarMorador from "../app/(app)/adicionar-morador";
import { ApiError } from "../src/api/client";

const mockAddLink = jest.fn();
const mockBack = jest.fn();
const mockUseAuth = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack, push: jest.fn(), replace: jest.fn() }),
}));

jest.mock("../src/api/client", () => {
  const actual = jest.requireActual("../src/api/client");
  return {
    ...actual,
    api: {
      units: {
        addLink: (...args: unknown[]) => mockAddLink(...args),
      },
    },
  };
});

jest.mock("../src/auth/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

const activeUnit = {
  linkId: "link-active",
  unitId: "unit-1",
  unitNumber: "101",
  kind: "proprietario" as const,
  startsOn: "2024-01-01",
  active: true,
  canManageHousehold: true,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({
    activeUnit,
    setActiveUnit: jest.fn(),
    user: null,
    status: "signedIn",
    signIn: jest.fn(),
    signOut: jest.fn(),
  });
});

it("mostra erro ao tentar adicionar sem informar o nome", async () => {
  await render(<AdicionarMorador />);

  fireEvent.press(screen.getByRole("button", { name: "Adicionar" }));

  await waitFor(() =>
    expect(screen.getByText("Informe o nome completo.")).toBeTruthy(),
  );
  expect(mockAddLink).not.toHaveBeenCalled();
});

it("adiciona morador com sucesso e navega de volta", async () => {
  const user = userEvent.setup();
  mockAddLink.mockResolvedValueOnce({});

  await render(<AdicionarMorador />);

  await user.type(screen.getByLabelText("Nome completo *"), "Ana Ferreira");
  await user.press(screen.getByRole("button", { name: "Adicionar" }));

  await waitFor(() =>
    expect(mockAddLink).toHaveBeenCalledWith(
      "unit-1",
      expect.objectContaining({
        kind: "morador",
        person: expect.objectContaining({ fullName: "Ana Ferreira" }),
      }),
    ),
  );
  await waitFor(() => expect(mockBack).toHaveBeenCalled());
});

it("adiciona dependente quando tipo Dependente está selecionado", async () => {
  const user = userEvent.setup();
  mockAddLink.mockResolvedValueOnce({});

  await render(<AdicionarMorador />);

  fireEvent.press(screen.getByRole("button", { name: "Dependente" }));
  await user.type(screen.getByLabelText("Nome completo *"), "Lucas Ferreira");
  await user.press(screen.getByRole("button", { name: "Adicionar" }));

  await waitFor(() =>
    expect(mockAddLink).toHaveBeenCalledWith(
      "unit-1",
      expect.objectContaining({ kind: "dependente" }),
    ),
  );
});

it("mostra erro de CPF duplicado (409)", async () => {
  const user = userEvent.setup();
  mockAddLink.mockRejectedValueOnce(new ApiError(409, "Conflict"));

  await render(<AdicionarMorador />);

  await user.type(screen.getByLabelText("Nome completo *"), "Ana Ferreira");
  await user.press(screen.getByRole("button", { name: "Adicionar" }));

  await waitFor(() =>
    expect(
      screen.getByText(
        "CPF já cadastrado neste condomínio. Fale com o síndico para vincular a pessoa existente.",
      ),
    ).toBeTruthy(),
  );
});

it("mostra erro de permissão insuficiente (403)", async () => {
  const user = userEvent.setup();
  mockAddLink.mockRejectedValueOnce(new ApiError(403, "Forbidden"));

  await render(<AdicionarMorador />);

  await user.type(screen.getByLabelText("Nome completo *"), "Ana Ferreira");
  await user.press(screen.getByRole("button", { name: "Adicionar" }));

  await waitFor(() =>
    expect(screen.getByText("Você não tem permissão para adicionar moradores.")).toBeTruthy(),
  );
});

it("mostra erro de dados inválidos (422)", async () => {
  const user = userEvent.setup();
  mockAddLink.mockRejectedValueOnce(new ApiError(422, "Unprocessable"));

  await render(<AdicionarMorador />);

  await user.type(screen.getByLabelText("Nome completo *"), "Ana Ferreira");
  await user.press(screen.getByRole("button", { name: "Adicionar" }));

  await waitFor(() =>
    expect(screen.getByText("Dados inválidos. Verifique CPF e os campos obrigatórios.")).toBeTruthy(),
  );
});
