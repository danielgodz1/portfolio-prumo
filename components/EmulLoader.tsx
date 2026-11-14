"use client";
import dynamic from "next/dynamic";

const EmulacaoSistema = dynamic(() => import("./EmulacaoSistema"), {
  ssr: true,
});

export default function EmulLoader({ id }: { id: "flowcheck" | "flowrequest" }) {
  return <EmulacaoSistema id={id} />;
}
