import Link from "next/link";
import { ROUTES } from "../links/routes";
export default function Navbar() {
  return (
    <>
      <Link href={ROUTES.HOME}>Home</Link>
      <Link href={ROUTES.FERRARI}>FERRARI</Link>
    </>
  );
}