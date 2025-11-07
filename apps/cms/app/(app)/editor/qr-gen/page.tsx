import { redirect } from "next/navigation";

import { validateRequest } from "@/server/auth/validate";
import { QRGeneratorPanel } from "@/components/editor/qr-generator-panel";

async function QRGenPage() {
	const { user } = await validateRequest();
	if (!user) {
		redirect("/login");
	}
	if (user.role !== "ADMIN" && user.role !== "EDITOR") {
		redirect("/");
	}
	return <QRGeneratorPanel />;
}

export default QRGenPage;

