public class AzureClient : IStorageAccountClient
{

private async Task<(long FoundColumns, long TotalSize)> ProcessSampleFiles(IEnumerable<BlobItem> allFiles, int sampleSize, string columnBase64)
{
    long foundCol = 0;
    long foundSize = 0;

    foreach (var sample in FilterSampleFiles(allFiles, sampleSize))
    {
        var columnInfo = await TrySampleBlob(sample, columnBase64);
        if (!columnInfo.KeyExists) continue;

        foundCol++;
        foundSize += columnInfo.Size;
    }

    return (foundCol, foundSize);
}

private async Task<IEnumerable<BlobItem>> GetAllBlobItems(string endsWith, string prefix)
{
    var allFiles = new List<BlobItem>();
    await foreach (var blob in _blobContainerClient.GetBlobsAsync(prefix: $"{prefix}/"))
    {
        if (blob.Name.EndsWith(endsWith, StringComparison.OrdinalIgnoreCase))
        {
            allFiles.Add(blob);
        }
    }
    return allFiles;
}

private static List<BlobItem> FilterSampleFiles(IEnumerable<BlobItem> entityDataFiles, int sampleSize)
{
    var reservoir = new List<BlobItem>(sampleSize);
    var count = 0;

    foreach (var item in entityDataFiles)
    {
        count++;

        if (count <= sampleSize)
        {
            reservoir.Add(item);
        }
        else
        {
            var j = Random.Next(count);
            if (j < sampleSize) reservoir[j] = item;
        }
    }

    return reservoir;
}

private async Task<ColumnInfo> TrySampleBlob(BlobItem blobItem, string columnBase64)
{
    try
    {
        var blobClient = _blobContainerClient.GetBlobClient(blobItem.Name);
        await using var stream = await blobClient.OpenReadAsync();

        using var jsonDoc = await JsonDocument.ParseAsync(stream);

        if (jsonDoc.RootElement.TryGetProperty(columnBase64, out var value))
        {
            return new ColumnInfo(
                KeyExists: true,
                Size: Encoding.UTF8.GetByteCount(value.GetString() ?? string.Empty)
            );
        }
        
        return new ColumnInfo(KeyExists: false, Size: 0);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error processing sample file {BlobItemName}", blobItem.Name);
        return new ColumnInfo(KeyExists: false, Size: 0);
    }
}