import {
  ReservationBookingDialog,
  type ReservationSubmitPayload,
} from "@/components/reservation/ReservationBookingDialog";
import { createRestaurantReservation } from "@/services/restaurantReservationApi";
import type { RestaurantReservationSettings } from "@/services/restaurantApi";

type RestaurantReservationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: string;
  restaurantName: string;
  reservationSettings?: RestaurantReservationSettings | string | null;
};

const RestaurantReservationDialog = ({
  open,
  onOpenChange,
  restaurantId,
  restaurantName,
  reservationSettings,
}: RestaurantReservationDialogProps) => {
  const handleSubmit = async (payload: ReservationSubmitPayload) => {
    await createRestaurantReservation({
      restaurantId,
      ...payload,
    });
  };

  return (
    <ReservationBookingDialog
      open={open}
      onOpenChange={onOpenChange}
      placeName={restaurantName}
      reservationSettings={reservationSettings}
      onSubmit={handleSubmit}
    />
  );
};

export default RestaurantReservationDialog;
