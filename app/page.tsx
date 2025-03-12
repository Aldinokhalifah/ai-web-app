"use client";

import { ReactNode, useState } from "react";
import Chat from "./components/Chat";



export default function Home(): JSX.Element {
  return (
    <main className="min-h-screen p-4 flex flex-col items-center justify-center">
      <Chat />
    </main>
  );
}