from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Eco Qadam Telegram botini ishga tushiradi (long polling)."

    def handle(self, *args, **options):
        from apps.bot.runner import run_forever

        run_forever()