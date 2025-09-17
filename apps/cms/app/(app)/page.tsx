import { redirect } from "next/navigation";

import { validateRequest } from "@/server/auth";

async function Home() {
  const { session } = await validateRequest();

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Home</h1>
    </div>
  );
}

export default Home;
