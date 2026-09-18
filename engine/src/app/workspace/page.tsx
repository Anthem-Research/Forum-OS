import { PrivateWorkspace } from "@/components/PrivateWorkspace";

export const metadata = { title: "Private workspace" };

export default function WorkspacePage() {
  return <PrivateWorkspace ownerId="device-workspace" ownerName="This device" />;
}
