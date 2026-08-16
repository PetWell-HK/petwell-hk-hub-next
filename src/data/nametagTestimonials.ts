/** Customer photos showing received PetWell anti-lost name tags. */
export const NAMETAG_TESTIMONIAL_IMAGES: string[] = [
  "/assets/nametag/testimonials/testimonial-01.png",
  "/assets/nametag/testimonials/testimonial-02.png",
  "/assets/nametag/testimonials/testimonial-03.png",
  "/assets/nametag/testimonials/testimonial-04.png",
  "/assets/nametag/testimonials/testimonial-05.png",
  "/assets/nametag/testimonials/testimonial-06.png",
  "/assets/nametag/testimonials/testimonial-07.png",
  "/assets/nametag/testimonials/testimonial-08.png",
  "/assets/nametag/testimonials/testimonial-09.png",
  "/assets/nametag/testimonials/testimonial-10.png",
  "/assets/nametag/testimonials/testimonial-11.png",
  "/assets/nametag/testimonials/testimonial-12.png",
  "/assets/nametag/testimonials/testimonial-13.png",
  "/assets/nametag/testimonials/testimonial-14.png",
  "/assets/nametag/testimonials/testimonial-15.png",
  "/assets/nametag/testimonials/testimonial-16.png",
  "/assets/nametag/testimonials/testimonial-17.png",
  "/assets/nametag/testimonials/testimonial-18.png",
  "/assets/nametag/testimonials/testimonial-19.png",
];

export function splitTestimonialRows(images: string[]): [string[], string[]] {
  const midpoint = Math.ceil(images.length / 2);
  return [images.slice(0, midpoint), images.slice(midpoint)];
}
