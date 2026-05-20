import { Button } from "@radix-ui/themes";
import { logout } from "../services/login-actions";

export default function LogoutButton() {
  return (
    <form action={logout}>
      <Button type="submit" variant="soft" color="red">
        Logout
      </Button>
    </form>
  );
}
