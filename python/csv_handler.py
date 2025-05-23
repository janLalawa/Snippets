import csv
from pathlib import Path
from models.translation_set import TranslationSet

def create_csv(obj_list: list, output_csv='translations.csv'):
    """Writes the translations dictionary to a CSV file with specified headings.
    encoding='utf-8-sig' includes the BOM to ensure Excel opens the file correctly.

    Args:
        translations_dict (dict): The translations dictionary.
        output_csv (str, optional): The output CSV file name. Defaults to 'translations.csv'.
    """
    with open(output_csv, mode='w', encoding='utf-8-sig', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['English Resx Path', 'Cy Resx Path', 'File Name', 'URL', 'Key', 'English', 'Welsh'])
        
        for obj in obj_list:
            for key, value in obj.translations.items():
                en_path = str(obj.resx_en_path)
                cy_path = str(obj.resx_cy_path)
                cshtml_name = obj.resx_file_name
                url = obj.route
                english_translation = value[0]
                welsh_translation = value[1]
                writer.writerow([en_path, cy_path, cshtml_name, url, key, english_translation, welsh_translation])

def read_csv(input_csv: str='translations.csv'):
    """Reads a CSV file and returns a list of dictionaries.

    Args:
        input_csv (str, optional): The input CSV file name. Defaults to 'translations.csv'.

    Returns:
        list: A list of dictionaries, each representing a row in the CSV file.
    """
    with open(input_csv, mode='r', encoding='utf-8-sig', newline='') as file:
        reader = csv.DictReader(file)
        data = [row for row in reader]
    return data


