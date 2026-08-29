import React, { useEffect } from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

export default function MultiButton(props) {
  const { multiButtonSelect, setMultiButtonSelect, label } = props;
  const handleAlignment = (event, newAlignment) => {
    if (newAlignment !== null && newAlignment !== undefined) {
      setMultiButtonSelect(newAlignment);
      if (newAlignment === "Fake User" || newAlignment === "User" || newAlignment === "Profile" || newAlignment === "Avatar") {

      } else {
        sessionStorage.setItem(
          "multiButton",
          JSON.stringify(newAlignment ? newAlignment : label[0])
        );
      }
    }
  };

  useEffect(() => {
    if (!setMultiButtonSelect || !label?.length) return;
    let stored = null;
    try {
      const raw = sessionStorage.getItem("multiButton");
      if (raw) stored = JSON.parse(raw);
    } catch {
      stored = null;
    }
    const next =
      stored != null && label.includes(stored) ? stored : label[0];
    setMultiButtonSelect(next);
  }, []);

  return (
    <div className="multiButton">
      {label?.map((item, index) => {


        return (
          <>
            <ToggleButtonGroup
              value={multiButtonSelect}
              exclusive={true}
              onChange={handleAlignment}
              aria-label="text alignment"
            >
              <ToggleButton key={index} value={item} aria-label={item} >
                <span className="text-capitalize">{item}</span>
              </ToggleButton>
            </ToggleButtonGroup>
          </>
        );
      })}
    </div>
  );
}
