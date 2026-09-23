"""Image upload validation for report photos."""

import io

from django.conf import settings
from django.core.exceptions import ValidationError
from PIL import Image


def validate_report_image(image):
    if image.size > settings.MAX_UPLOAD_SIZE:
        raise ValidationError("Rasm hajmi 6 MB dan oshmasligi kerak.")

    if not image.content_type.startswith("image/"):
        raise ValidationError("Faqat rasm fayllari qabul qilinadi.")

    try:
        img = Image.open(image)
        img.verify()
    except Exception as exc:
        raise ValidationError("Fayl buzilgan yoki rasm emas.") from exc

    # Re-open after verify() (verify consumes the handle)
    image.seek(0)
    try:
        probe = Image.open(io.BytesIO(image.read()))
        probe.thumbnail((16, 16))
        pixels = probe.convert("RGB").load() if hasattr(probe, "convert") else None
    except Exception:
        pixels = None

    # Basic "not blank" sanity check
    if pixels is not None:
        colors = set()
        for x in range(probe.width):
            for y in range(probe.height):
                colors.add(pixels[x, y])
        if len(colors) <= 1:
            raise ValidationError("Rasm bo'sh yoki bir xil rangda ko'rinadi.")

    image.seek(0)
    return image