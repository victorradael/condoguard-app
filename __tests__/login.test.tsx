import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import Login from "../app/(public)/login";
import { ApiError } from "../src/api/client";

const mockSignIn = jest.fn();
jest.mock("../src/auth/AuthContext", () => ({ useAuth: () => ({ signIn: mockSignIn }) }));

it("mostra erro em credenciais inválidas", async () => {
  mockSignIn.mockRejectedValueOnce(new ApiError(401, "x"));
  await render(<Login />);
  await fireEvent.changeText(screen.getByLabelText("E-mail"), "ana@example.com");
  await fireEvent.changeText(screen.getByLabelText("Senha"), "errada");
  await fireEvent.press(screen.getByRole("button", { name: "Entrar" }));
  await waitFor(() => expect(screen.getByText("E-mail ou senha inválidos.")).toBeTruthy());
  expect(mockSignIn).toHaveBeenCalledWith("ana@example.com", "errada", undefined);
});
