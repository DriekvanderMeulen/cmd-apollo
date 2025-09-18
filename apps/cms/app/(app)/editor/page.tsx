import { redirect } from "next/navigation"

import { validateRequest } from "@/server/auth/validate"
import { EditorPanel } from "@/components/editor/editor-panel"

async function EditorPage() {
	const { user } = await validateRequest()
	if (!user) {
		redirect("/login")
	}
	if (user.role !== "ADMIN" && user.role !== "EDITOR") {
		redirect("/")
	}
	return <EditorPanel />
}

export default EditorPage


