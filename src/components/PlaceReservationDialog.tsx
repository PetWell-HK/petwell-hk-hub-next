import {
  ReservationBookingDialog,
  type ReservationSubmitPayload,
} from "@/components/reservation/ReservationBookingDialog";
import { createPlaceReservation } from "@/services/placeReservationApi";
import type { RestaurantReservationSettings } from "@/services/restaurantApi";

type PlaceReservationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeType: "SALON" | "CLINIC" | "LODGING";
  placeId: string;
  placeName: string;
  reservationSettings?: RestaurantReservationSettings | string | null;
};

const PlaceReservationDialog = ({
  open,
  onOpenChange,
  placeType,
  placeId,
  placeName,
  reservationSettings,
}: PlaceReservationDialogProps) => {
  const handleSubmit = async (payload: ReservationSubmitPayload) => {
    await createPlaceReservation({
      placeType,
      placeId,
      ...payload,
    });
  };

  return (
    <ReservationBookingDialog
      open={open}
      onOpenChange={onOpenChange}
      placeName={placeName}
      reservationSettings={reservationSettings}
      onSubmit={handleSubmit}
    />
  );
};

export default PlaceReservationDialog;
