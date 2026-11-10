import { fireEvent, render, screen, userEvent, waitFor } from "@testing-library/react-native";
import Convite from "../app/(public)/convite";
import { ApiError } from "../src/api/client";

const mockInspect = jest.fn();
const mockAccept = jest.fn();
const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));

jest.mock("../src/api/client", () => {
  const actual = jest.requireActual("../src/api/client");
  return {
    ...actual,
    api: {
      invitations: {
        inspect: (...args: unknown[]) => mockInspect(...args),
        accept: (...args: unknown[]) => mockAccept(...args),
      },
    },
  };
});

beforeEach(() => jest.clearAllMocks());

const TOKEN = "AAAA-BBBB-CCCC-DDDD-EEEE-FFFF-1111-2222";

const infoNoAccount = {
  condominiumName: "Cond. Verde",
  personName: "Ana Silva",
  email: "ana@example.com",
  accountExists: false,
};

const infoWithAccount = {
  condominiumName: "Cond. Azul",
  personName: "Bruno Lima",
  email: "bruno@example.com",
  accountExists: true,
};

describe("Convite — conta nova", () => {
  it("fluxo completo: digitar código → ver info → criar senha → redirecionar ao login", async () => {
    const user = userEvent.setup();
    mockInspect.mockResolvedValueOnce(infoNoAccount);
    mockAccept.mockResolvedValueOnce({ condominiumId: "condo-1", email: "ana@example.com", verifyEmail: false });

    await render(<Convite />);

    await user.type(screen.getByLabelText("Código do convite"), TOKEN);
    await user.press(screen.getByRole("button", { name: "Verificar" }));

    await waitFor(() => expect(mockInspect).toHaveBeenCalledWith(TOKEN));
    await waitFor(() => expect(screen.getByText("Cond. Verde")).toBeTruthy());
    expect(screen.getByText("Ana Silva")).toBeTruthy();

    await user.type(screen.getByLabelText("Senha"), "MinhaS3nh@");
    await user.type(screen.getByLabelText("Confirmar senha"), "MinhaS3nh@");
    await user.press(screen.getByRole("button", { name: "Ativar convite" }));

    await waitFor(() =>
      expect(mockAccept).toHaveBeenCalledWith(TOKEN, "MinhaS3nh@", undefined),
    );
    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith(
        expect.objectContaining({ pathname: "/(public)/login" }),
      ),
    );
  });

  it("mostra erro quando senhas não coincidem", async () => {
    const user = userEvent.setup();
    mockInspect.mockResolvedValueOnce(infoNoAccount);

    await render(<Convite />);

    await user.type(screen.getByLabelText("Código do convite"), TOKEN);
    await user.press(screen.getByRole("button", { name: "Verificar" }));
    await waitFor(() => expect(screen.getByText("Cond. Verde")).toBeTruthy());

    await user.type(screen.getByLabelText("Senha"), "MinhaS3nh@");
    await user.type(screen.getByLabelText("Confirmar senha"), "Diferente1!");
    await user.press(screen.getByRole("button", { name: "Ativar convite" }));

    await waitFor(() => expect(screen.getByText("As senhas não coincidem.")).toBeTruthy());
    expect(mockAccept).not.toHaveBeenCalled();
  });

  it("mostra tela de verificação de e-mail quando verifyEmail=true", async () => {
    const user = userEvent.setup();
    mockInspect.mockResolvedValueOnce(infoNoAccount);
    mockAccept.mockResolvedValueOnce({ condominiumId: "condo-1", email: "ana@example.com", verifyEmail: true });

    await render(<Convite />);

    await user.type(screen.getByLabelText("Código do convite"), TOKEN);
    await user.press(screen.getByRole("button", { name: "Verificar" }));
    await waitFor(() => expect(screen.getByText("Cond. Verde")).toBeTruthy());

    await user.type(screen.getByLabelText("Senha"), "MinhaS3nh@");
    await user.type(screen.getByLabelText("Confirmar senha"), "MinhaS3nh@");
    await user.press(screen.getByRole("button", { name: "Ativar convite" }));

    await waitFor(() => expect(screen.getByText("Verifique seu e-mail")).toBeTruthy());
    expect(mockReplace).not.toHaveBeenCalled();
  });
});

describe("Convite — conta existente", () => {
  it("fluxo completo: digitar código → ver info → confirmar com senha → redirecionar ao login", async () => {
    const user = userEvent.setup();
    mockInspect.mockResolvedValueOnce(infoWithAccount);
    mockAccept.mockResolvedValueOnce({ condominiumId: "condo-2", email: "bruno@example.com", verifyEmail: false });

    await render(<Convite />);

    await user.type(screen.getByLabelText("Código do convite"), TOKEN);
    await user.press(screen.getByRole("button", { name: "Verificar" }));

    await waitFor(() => expect(screen.getByText("Cond. Azul")).toBeTruthy());
    expect(screen.getByText("Bruno Lima")).toBeTruthy();

    await user.type(screen.getByLabelText("Senha"), "SenhaExistente1!");
    await user.press(screen.getByRole("button", { name: "Ativar convite" }));

    await waitFor(() =>
      expect(mockAccept).toHaveBeenCalledWith(TOKEN, "SenhaExistente1!", undefined),
    );
    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith(
        expect.objectContaining({ pathname: "/(public)/login" }),
      ),
    );
  });

  it("mostra erro de senha incorreta (401)", async () => {
    const user = userEvent.setup();
    mockInspect.mockResolvedValueOnce(infoWithAccount);
    mockAccept.mockRejectedValueOnce(new ApiError(401, "Unauthorized"));

    await render(<Convite />);

    await user.type(screen.getByLabelText("Código do convite"), TOKEN);
    await user.press(screen.getByRole("button", { name: "Verificar" }));
    await waitFor(() => expect(screen.getByText("Cond. Azul")).toBeTruthy());

    await user.type(screen.getByLabelText("Senha"), "errada");
    await user.press(screen.getByRole("button", { name: "Ativar convite" }));

    await waitFor(() => expect(screen.getByText("Senha incorreta para a conta existente.")).toBeTruthy());
  });
});

describe("Convite — erros de token", () => {
  it("mostra erro para token inválido (400)", async () => {
    const user = userEvent.setup();
    mockInspect.mockRejectedValueOnce(new ApiError(400, "Bad Request"));

    await render(<Convite />);

    await user.type(screen.getByLabelText("Código do convite"), "INVALIDO");
    await user.press(screen.getByRole("button", { name: "Verificar" }));

    await waitFor(() =>
      expect(screen.getByText("Convite inválido, já usado ou expirado.")).toBeTruthy(),
    );
  });

  it("exibe botão Verificar habilitado ao digitar código", async () => {
    const user = userEvent.setup();

    await render(<Convite />);

    await user.type(screen.getByLabelText("Código do convite"), TOKEN);
    expect(screen.getByRole("button", { name: "Verificar" })).toBeTruthy();
  });
});

