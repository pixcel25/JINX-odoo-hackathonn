from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='employee',
            name='department',
            field=models.CharField(default='', max_length=100),
        ),
        migrations.AddField(
            model_name='employee',
            name='manager',
            field=models.CharField(default='', max_length=200),
        ),
        migrations.AddField(
            model_name='employee',
            name='location',
            field=models.CharField(default='', max_length=200),
        ),
    ]
