"use client";

import Image from "next/image";
import styles from "./page.module.scss";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/axios";
import { z } from "zod";

import { Button, Input, LoadingSpinner } from "@rbeiro-ui/react-components";
import { useEffect, useState } from "react";
import { ProvisioningForm } from "@/components/ProvisioningForm";
import { DeprovisionForm } from "@/components/DeprovisionForm";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1>Bem-vindo</h1>
    </main>
  );
}
