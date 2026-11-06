"""Isolated provider template; it intentionally has no database dependency."""

from .contract import ProviderContext, health

__all__ = ["ProviderContext", "health"]
