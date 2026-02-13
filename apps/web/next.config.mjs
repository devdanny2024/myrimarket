/** @type {import('next').NextConfig} */
import path from "path";

const nextConfig = {
  // Prevent Next from accidentally picking some parent folder as the workspace root
  // when multiple lockfiles exist on the machine.
  outputFileTracingRoot: path.join(process.cwd(), "..", ".."),
};

export default nextConfig;
