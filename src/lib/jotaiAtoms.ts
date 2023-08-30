import { atom } from "jotai";

type selectedUnprovisionedONTAtomProps = {
  serialNumber: string;
  PONport: string;
  slotGPON: string;
  ONUposition: string;
} | null;

export const selectedUnprovisionedONTAtom =
  atom<selectedUnprovisionedONTAtomProps>(null);
