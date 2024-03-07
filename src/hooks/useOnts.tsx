import { api } from "@/lib/axios";
import { useEffect, useState } from "react";

type OntHookType = {
  adsName: string;
  vendorName: string;
};

export const useOnts = ({ adsName, vendorName }: OntHookType) => {
  const [isLoading, setIsLoading] = useState(false);
  const [listOfAllOnts, setListOfAllOnts] = useState<
    { id: string; line: string }[] | null
  >(null);
  useEffect(() => {
    (async function getAllOnts() {
      setListOfAllOnts(null);
      setIsLoading(true);

      api
        .post(
          "/getAllOntsFromAds",
          {
            params: {
              currentAdsName: adsName,
              currentVendorName: vendorName,
            },
          },

          { timeout: 15000 }
        )
        .then((response) => {
          if (response.status == 201) {
            setListOfAllOnts(response.data.commandLineResult);
          }
        })
        .finally(() => setIsLoading(false));
    })();
  }, [adsName, vendorName, isLoading]);

  return { isLoading, listOfAllOnts };
};
