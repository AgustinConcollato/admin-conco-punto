import { useContext } from "react";
import { MLPublishContext } from "../../../contexts/MLPublishContext";

export function useMLPublish() {
    const ctx = useContext(MLPublishContext);
    if (!ctx) throw new Error("useMLPublish must be used within MLPublishProvider");
    return ctx;
}
