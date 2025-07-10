from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('inventory_manager', 'Inventory Manager'),
        ('hr', 'HR'),
        ('sales', 'Sales'),
    ]
    role = models.CharField(max_length=32, choices=ROLE_CHOICES, default='sales')
    department = models.CharField(max_length=64, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
