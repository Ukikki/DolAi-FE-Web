interface Props {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export default function CustomTooltip({ active, payload, label }: Props) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      style={{
        background: "",
        color: "white",
        padding: "0.7vw 0.4vw",
        borderRadius: "10px",
        fontFamily: "Jamsil_R",
        fontSize: "0.9vw",
        boxShadow: "0px 5px 5px rgba(0,0,0,0.15)",
      }}
    >
      <div style={{ fontFamily: "Jamsil_M", marginBottom: "0.5rem" }}>{label}</div>
      {payload.map((entry, index) => (
        <div key={index} style={{ display: "flex", justifyContent: "space-between", gap: "1vw" }}>
          <span>{entry.name}</span>
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}
