import useSWR from "swr";

export default function Notifications({ setNotifOpen }) {
  const { data } = useSWR();
  return <div id="popover"></div>;
}
