import signal
import subprocess
import sys

from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Django server va Telegram botni birgalikda ishga tushiradi"

    def add_arguments(self, parser):
        parser.add_argument("addrport", nargs="?", default=None, help="runserver addresi:port (ixtiyoriy)")

    def handle(self, *args, **options):
        self.stdout.write("Eco Qadam: Django + Telegram bot birgalikda ishga tushmoqda...\n")

        addrport = options.get("addrport")
        bot_args = [sys.executable, sys.argv[0], "runbot"]
        bot = subprocess.Popen(bot_args)

        def stop(*_):
            try:
                bot.terminate()
            except Exception:
                pass

        signal.signal(signal.SIGINT, stop)
        signal.signal(signal.SIGTERM, stop)

        try:
            call_command("runserver", *(addrport,) if addrport else ())
        finally:
            try:
                bot.terminate()
            except Exception:
                pass