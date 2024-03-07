"use client";
import { atom, createStore, Provider } from "jotai";
import { ReactNode } from "react";

const provisioningStore = createStore();

export const ProvisioningProvider = ({ children }: { children: ReactNode }) => {
  return <Provider store={provisioningStore}>{children}</Provider>;
};

type selectedUnprovisionedONTAtomType = {
  serialNumber: string;
  PONport: string;
  slotGPON: string;
  ONUposition: string;
} | null;

export const selectedUnprovisionedONTAtom =
  atom<selectedUnprovisionedONTAtomType>(null);

type selectedOntToBeDeprovisionedType = {
  serialNumber: string;
  PONport: string;
  slotGPON: string;
  ONUposition: string;
} | null;

export const selectedOntToBeDeprovisionedAtom =
  atom<selectedOntToBeDeprovisionedType>(null);
