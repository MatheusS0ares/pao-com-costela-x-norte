import { ImageResponse } from "next/og";
import { MarcaSanduiche } from "../icon";

export async function GET() {
  return new ImageResponse(<MarcaSanduiche tamanho={192} />, { width: 192, height: 192 });
}
