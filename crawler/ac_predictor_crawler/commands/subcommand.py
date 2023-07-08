from argparse import ArgumentParser, Namespace
from dataclasses import dataclass, field
from typing import Callable, List, Optional

@dataclass
class SubCommand:
    name: str
    
    parser_initializer: Callable[[ArgumentParser], None]
    handler: Callable[[Namespace], None]

    aliases: List[str] = field(default_factory=list)
    description: Optional[str] = None

def register_subcommands(parser: ArgumentParser, subcommands: List[SubCommand]):
    subparser = parser.add_subparsers()
    for command in subcommands:
        parser = subparser.add_parser(command.name, description=command.description, aliases=command.aliases, help=command.description)
        command.parser_initializer(parser)
        parser.set_defaults(handler=command.handler)
