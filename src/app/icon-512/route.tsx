import { ImageResponse } from "next/og";
import { MarcaSanduiche } from "../icon";

export async function GET() {
  return new ImageResponse(<MarcaSanduiche tamanho={512} />, { width: 512, height: 512 });
}
