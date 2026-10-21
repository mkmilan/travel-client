"use client";
import Image from "next/image";
import { API_URL } from "@/utils/config";
import { apiPhotoImageProps } from "@/utils/mediaPolicy.mjs";

export default function ApiAwareImage(props) {
  return <Image {...props} {...apiPhotoImageProps(props.src, API_URL)} />;
}
