import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import Moradores from "../app/(app)/moradores";
import type { Link } from "../src/api/client";

const mockLinks = jest.fn();
const mockEnd = jest.fn();
const mockDelete = jest.fn();
const mockBack = jest.fn();
const mockPush = jest.fn();
const mockUseAuth = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack, push: mockPush, replace: jest.fn() }),
}));

jest.mock("../src/api/client", () => ({
  api: {
    units: { links: (...args: unknown[]) => mockLinks(...args) },
    links: {
      end: (...args: unknown[]) => mockEnd(...args),
      delete: (...args: unknown[]) => mockDelete(...args),
    },
  },
  ApiError: jest.requireActual("../src/api/client").ApiError,
}));

jest.mock("../src/auth/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

const activeUnit = {
  linkId: "link-active",
  unitId: "unit-1",
  unitNumber: "101",
  blockName: "Torre A",
  kind: "proprietario" as const,
  startsOn: "2024-01-01",
  active: true,
  canManageHousehold: true,
};

const link1: Link = {
  id: "link-1",
  unitId: "unit-1",
  personId: "person-1",
  personName: "Maria Souza",
  kind: "morador",
  startsOn: "2024-06-01",
  active: true,
};

const link2: Link = {
  id: "link-2",
  unitId: "unit-1",
  personId: "person-2",
  personName: "Pedro Lima",
  kind: "dependente",
  startsOn: "2024-07-01",
  active: true,
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

it("lista os moradores da unidade", async () => {
  mockLinks.mockResolvedValueOnce({ items: [link1, link2] });

  render(<Moradores />);

  await waitFor(() => expect(screen.getByText("Maria Souza")).toBeTruthy());
  expect(screen.getByText("Pedro Lima")).toBeTruthy();
  expect(screen.getByText("Morador")).toBeTruthy();
  expect(screen.getByText("Dependente")).toBeTruthy();
});

it("exibe estado vazio quando não há moradores", async () => {
  mockLinks.mockResolvedValueOnce({ items: [] });

  render(<Moradores />);

  await waitFor(() => expect(screen.getByText("Nenhum morador ativo.")).toBeTruthy());
});

it("mostra botões Remover para morador e dependente quando canManageHousehold=true", async () => {
  mockLinks.mockResolvedValueOnce({ items: [link1, link2] });

  render(<Moradores />);

  await waitFor(() => expect(screen.getByText("Maria Souza")).toBeTruthy());
  expect(screen.getByLabelText("Remover Maria Souza")).toBeTruthy();
  expect(screen.getByLabelText("Remover Pedro Lima")).toBeTruthy();
});

it("não mostra botões Remover quando canManageHousehold=false", async () => {
  mockUseAuth.mockReturnValue({
    activeUnit: { ...activeUnit, canManageHousehold: false },
    setActiveUnit: jest.fn(),
    user: null,
    status: "signedIn",
    signIn: jest.fn(),
    signOut: jest.fn(),
  });
  mockLinks.mockResolvedValueOnce({ items: [link1] });

  render(<Moradores />);

  await waitFor(() => expect(screen.getByText("Maria Souza")).toBeTruthy());
  expect(screen.queryByLabelText("Remover Maria Souza")).toBeNull();
});

it("não mostra botão Remover para vínculo de tipo proprietário", async () => {
  const proprietarioLink: Link = {
    ...link1,
    id: "link-prop",
    personName: "Carlos Prop",
    kind: "proprietario",
  };
  mockLinks.mockResolvedValueOnce({ items: [proprietarioLink] });

  render(<Moradores />);

  await waitFor(() => expect(screen.getByText("Carlos Prop")).toBeTruthy());
  expect(screen.queryByLabelText("Remover Carlos Prop")).toBeNull();
});

it("mostra erro quando API falha ao carregar moradores", async () => {
  mockLinks.mockRejectedValueOnce(new Error("network"));

  render(<Moradores />);

  await waitFor(() =>
    expect(screen.getByText("Não foi possível carregar os moradores.")).toBeTruthy(),
  );
});

it("mostra botão Adicionar e navega para a tela correta", async () => {
  mockLinks.mockResolvedValueOnce({ items: [] });

  render(<Moradores />);

  await waitFor(() =>
    expect(screen.getByRole("button", { name: "+ Adicionar morador ou dependente" })).toBeTruthy(),
  );
  fireEvent.press(
    screen.getByRole("button", { name: "+ Adicionar morador ou dependente" }),
  );
  expect(mockPush).toHaveBeenCalledWith("/(app)/adicionar-morador");
});

it("não mostra botão Adicionar quando canManageHousehold=false", async () => {
  mockUseAuth.mockReturnValue({
    activeUnit: { ...activeUnit, canManageHousehold: false },
    setActiveUnit: jest.fn(),
    user: null,
    status: "signedIn",
    signIn: jest.fn(),
    signOut: jest.fn(),
  });
  mockLinks.mockResolvedValueOnce({ items: [] });

  render(<Moradores />);

  await waitFor(() => expect(screen.getByText("Nenhum morador ativo.")).toBeTruthy());
  expect(
    screen.queryByRole("button", { name: "+ Adicionar morador ou dependente" }),
  ).toBeNull();
});
