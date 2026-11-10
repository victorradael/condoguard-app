import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import Perfil from "../app/(app)/perfil";
import { ApiError } from "../src/api/client";
import type { Profile } from "../src/api/client";

const mockGet = jest.fn();
const mockUpdate = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack, push: jest.fn(), replace: jest.fn() }),
}));

jest.mock("../src/api/client", () => {
  const actual = jest.requireActual("../src/api/client");
  return {
    ...actual,
    api: {
      profile: {
        get: () => mockGet(),
        update: (...args: unknown[]) => mockUpdate(...args),
      },
    },
  };
});

const profileData: Profile = {
  person: {
    id: "person-1",
    fullName: "João Silva",
    email: "joao@example.com",
    phone: "(11) 99999-0000",
  },
  units: [],
};

beforeEach(() => jest.clearAllMocks());

it("exibe os dados do perfil carregados da API", async () => {
  mockGet.mockResolvedValueOnce(profileData);

  render(<Perfil />);

  await waitFor(() => expect(screen.getByDisplayValue("João Silva")).toBeTruthy());
  expect(screen.getByDisplayValue("(11) 99999-0000")).toBeTruthy();
  expect(screen.getByText("joao@example.com")).toBeTruthy();
});

it("exibe CPF quando presente no perfil", async () => {
  mockGet.mockResolvedValueOnce({
    ...profileData,
    person: { ...profileData.person, cpf: "123.456.789-00" },
  });

  render(<Perfil />);

  await waitFor(() => expect(screen.getByText("123.456.789-00")).toBeTruthy());
});

it("salva perfil e exibe confirmação de sucesso", async () => {
  mockGet.mockResolvedValueOnce(profileData);
  mockUpdate.mockResolvedValueOnce({
    ...profileData,
    person: { ...profileData.person, fullName: "João Atualizado" },
  });

  render(<Perfil />);

  await waitFor(() => expect(screen.getByDisplayValue("João Silva")).toBeTruthy());
  fireEvent.press(screen.getByRole("button", { name: "Salvar" }));

  await waitFor(() => expect(mockUpdate).toHaveBeenCalled());
  await waitFor(() => expect(screen.getByText("Perfil salvo com sucesso!")).toBeTruthy());
});

it("mostra erro 422 ao salvar com dados inválidos", async () => {
  mockGet.mockResolvedValueOnce(profileData);
  mockUpdate.mockRejectedValueOnce(new ApiError(422, "Unprocessable"));

  render(<Perfil />);

  await waitFor(() => expect(screen.getByDisplayValue("João Silva")).toBeTruthy());
  fireEvent.press(screen.getByRole("button", { name: "Salvar" }));

  await waitFor(() =>
    expect(screen.getByText("Dados inválidos. Verifique os campos.")).toBeTruthy(),
  );
});

it("mostra erro genérico ao salvar quando API falha com status não mapeado", async () => {
  mockGet.mockResolvedValueOnce(profileData);
  mockUpdate.mockRejectedValueOnce(new ApiError(500, "Internal Server Error"));

  render(<Perfil />);

  await waitFor(() => expect(screen.getByDisplayValue("João Silva")).toBeTruthy());
  fireEvent.press(screen.getByRole("button", { name: "Salvar" }));

  await waitFor(() =>
    expect(screen.getByText("Não foi possível salvar. Tente novamente.")).toBeTruthy(),
  );
});

it("mostra erro quando não consegue carregar o perfil", async () => {
  mockGet.mockRejectedValueOnce(new Error("network"));

  render(<Perfil />);

  await waitFor(() =>
    expect(screen.getByText("Não foi possível carregar o perfil.")).toBeTruthy(),
  );
});
