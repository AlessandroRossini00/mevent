"use client";

import InfoBlock from "@/components/ui/info-block";

type EventMetaGridProps = {
  date: string;
  time: string;
  members: string;
  price: string;
};

export default function EventMetaGrid({
  date,
  time,
  members,
  price,
}: EventMetaGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
      <InfoBlock label="Data" value={date} />
      <InfoBlock label="Ora" value={time} />
      <InfoBlock label="Membri" value={members} />
      <InfoBlock label="Prezzo" value={price} />
    </div>
  );
}
