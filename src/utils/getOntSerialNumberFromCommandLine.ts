export const getOntSerialNumberFromCommandLine = (line: string) => {
  const startOfSerial = line.indexOf("ALCL");
  const serialNumber = line.slice(startOfSerial, startOfSerial + 12);
  const serialNumberWithTwoDots =
    serialNumber.slice(0, 4) + ":" + serialNumber.slice(4);

  return serialNumberWithTwoDots;
};
