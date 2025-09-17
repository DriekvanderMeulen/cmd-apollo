import { toast } from "react-hot-toast";

type ErrorTypes = "DEFAULT" | "UPDATE" | "DELETE" | "CREATE";

export function showError(type: ErrorTypes, record?: string) {
  let message = "";

  switch (type) {
    case "UPDATE":
      message = "Failed to update";
      break;
    case "DELETE":
      message = "Failed to delete";
      break;
    case "CREATE":
      message = "Failed to create";
      break;
    default:
      message = "An error occurred.";
  }

  if (type !== "DEFAULT" && record) {
    message += ` ${record}.`;
  } else if (type !== "DEFAULT") {
    message += " record.";
  }

  toast.error(message);
}
