import { HiMiniArrowRightOnRectangle } from "react-icons/hi2";

import { logout } from "@/server/auth/actions";

function Logout() {
  return (
    // @ts-ignore
    <form action={logout}>
      <button className="flex items-center space-x-2 rounded-ui bg-neutral-200 py-2 pl-4 pr-3.5 font-medium text-red-600">
        <span>Uitloggen</span>
        <HiMiniArrowRightOnRectangle size={20} />
      </button>
    </form>
  );
}

export default Logout;
