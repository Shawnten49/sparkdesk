class DomainError(Exception):
    """Base class for errors that can be translated into HTTP responses."""


class NotFoundError(DomainError):
    pass


class ValidationError(DomainError):
    pass


class InvalidOperationError(DomainError):
    pass
