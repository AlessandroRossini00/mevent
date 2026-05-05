"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Flex,
  Select,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import {
  EVENT_CATEGORIES,
  EVENT_LIMITS,
  type EventCategory,
} from "@/features/events/services/constants";
import LocationPickerField from "@/features/events/components/event-form/location-picker-field";
import EventImagePicker from "@/features/events/components/event-form/event-image-picker";
import FieldBlock from "@/components/ui/field-block";

export type EventFormValues = {
  title?: string | null;
  description?: string | null;
  category?: string | null;
  event_at?: string | null;
  location_name?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  price?: number | null;
  max_members?: number | null;
  maps_url?: string | null;
  image_url?: string | null;
};

type EventFormProps = {
  title: string;
  submitLabel: string;
  error?: string | null;
  isPending?: boolean;
  defaultValues?: EventFormValues;
  onSubmit: (formData: FormData) => void | Promise<void>;
};

export default function EventForm({
  title,
  submitLabel,
  error,
  isPending = false,
  defaultValues,
  onSubmit,
}: EventFormProps) {
  const [titleValue, setTitleValue] = useState(defaultValues?.title ?? "");
  const [descriptionValue, setDescriptionValue] = useState(
    defaultValues?.description ?? "",
  );
  const [categoryValue, setCategoryValue] = useState<EventCategory>(
    EVENT_CATEGORIES.includes((defaultValues?.category ?? "") as EventCategory)
      ? (defaultValues?.category as EventCategory)
      : EVENT_CATEGORIES[0],
  );
  const [maxMembersValue, setMaxMembersValue] = useState(
    defaultValues?.max_members !== null &&
      defaultValues?.max_members !== undefined
      ? String(defaultValues.max_members)
      : "",
  );

  return (
    <Card size="4">
      <form action={onSubmit}>
        <input type="hidden" name="category" value={categoryValue} />

        <Flex direction="column" gap="4">
          <Text size="4" weight="bold">
            {title}
          </Text>

          <EventImagePicker defaultUrl={defaultValues?.image_url ?? null} />

          <FieldBlock
            label="Titolo"
            counter={`${titleValue.length}/${EVENT_LIMITS.title}`}
          >
            <TextField.Root
              name="title"
              value={titleValue}
              required
              maxLength={EVENT_LIMITS.title}
              onChange={(event) => setTitleValue(event.target.value)}
            />
          </FieldBlock>

          <FieldBlock
            label="Descrizione"
            counter={`${descriptionValue.length}/${EVENT_LIMITS.description}`}
          >
            <TextArea
              name="description"
              value={descriptionValue}
              maxLength={EVENT_LIMITS.description}
              onChange={(event) => setDescriptionValue(event.target.value)}
            />
          </FieldBlock>

          <FieldBlock label="Categoria">
            <Select.Root
              value={categoryValue}
              onValueChange={(value) =>
                setCategoryValue(value as EventCategory)
              }
            >
              <Select.Trigger />
              <Select.Content>
                {EVENT_CATEGORIES.map((category) => (
                  <Select.Item key={category} value={category}>
                    {category}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </FieldBlock>

          <FieldBlock label="Data e ora">
            <TextField.Root
              name="event_at"
              type="datetime-local"
              defaultValue={defaultValues?.event_at ?? ""}
              required
            />
          </FieldBlock>

          <LocationPickerField
            defaultValues={{
              location_name: defaultValues?.location_name,
              address: defaultValues?.address,
              latitude: defaultValues?.latitude,
              longitude: defaultValues?.longitude,
              maps_url: defaultValues?.maps_url,
            }}
          />

          <Flex gap="3">
            <div className="flex-1">
              <FieldBlock label="Prezzo">
                <TextField.Root
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={
                    defaultValues?.price !== null &&
                    defaultValues?.price !== undefined
                      ? String(defaultValues.price)
                      : ""
                  }
                />
              </FieldBlock>
            </div>

            <div className="flex-1">
              <FieldBlock
                label="Max membri"
                counter={`${maxMembersValue || "0"}/${EVENT_LIMITS.maxMembers}`}
              >
                <TextField.Root
                  name="max_members"
                  type="number"
                  min="1"
                  max={EVENT_LIMITS.maxMembers}
                  value={maxMembersValue}
                  onChange={(event) => setMaxMembersValue(event.target.value)}
                />
              </FieldBlock>
            </div>
          </Flex>

          {error ? <Text color="red">{error}</Text> : null}

          <Button type="submit" loading={isPending}>
            {submitLabel}
          </Button>
        </Flex>
      </form>
    </Card>
  );
}
