# Audio Available
Do we have an audio file for an article?

Currently hosted on [Heroku](https://ftlabs-audio-available.herokuapp.com).

## What does it do?

audio-available is the place to find out whether or not there is an audio version of an article on FT.com.

## Why does it exist?

At the moment, audio content doesn't have a proper, permanent place to live at the FT. Over the last little while, FT Labs has been exploring different applications of audio across the FT's content. Having a simple service that can tell us whether or not a given article has an audio file, and where we can find it, seemed like a pretty useful thing to have.

## Usage

### Checking for an audio article

To check for the existence of an audio file for an article, you can hit the `/check/:UUID`. 

You can pass any FT content UUID to check the availability, location and basic information of an audio file.

The `UUID` must be a valid v4 UUID. 

**Example**

`https://audio-available.ft.com/check/0e69c5a4-a4cd-11e6-8898-79a99e2a4de6`

**Response**

*The HTTP status code for any lookup will be `200`, even if a file does not exist. A status code of `420` will be returned if the request is improper (invalid UUID, for example).*

```
// If file exists...

{
	"haveFile": true,
	"url": "[ABSOLUTE PATH TO AUDIO FILE]",
	provider: "ftlabs-tts",
	provider_name: "FT Labs text-to-speech service",
	ishuman : "true"
	"size": "2744769",
	"duration": {
		"milliseconds": 343040,
		"seconds": "343.04",
		"humantime": "05:43"
	}
}

// If file does not exist...

{
	"haveFile": false
}

```

### Triggering a purge of the audio-available cache

Caching has been moved from the app to [Fastly](https://docs.fastly.com/api/purge#purge_3aa1d66ee81dbfed0b03deed0fa16a9a). Every audio service (absorber/management et al) that can manipulate the S3 audio buckets or DynamoDB tables should trigger a cache purge to the audio available service. This can be done by making a `PURGE` request to the URL that is to be purged.

`curl -X PURGE https://audio-available.ft.com/check/2cc51074-2c10-11e7-9ec8-168383da43b7`

**Response**
```
{
  "status":"ok",
  "id":"108-1391560174-974124"
}
```

### /check response properties

**haveFile**: [BOOLEAN] true *or* false

*The following properties will only appear if there is a valid audio file*

**url**: [STRING] 

**size**: [NUMBER] *size of available audio file in bytes*

**provider** [STRING] *The short name of any audio provider as determined by the config in the [Absorber](https://github.com/ftlabs/Absorber#audio_rss_endpoints) service*

**provider_name** [STRING] *The long version of the provider short name. This value is intended to be displayed to a user as audio is being played.*

**ishuman** [BOOLEAN] *Some audio files will be of generated voices. This property indicates whether or not the file has been recorded by a person or not*

**duration**: [OBJECT]

- **milliseconds**: [NUMBER] *length of audio in milliseconds*
- **seconds**: [STRING] *length of audio in seconds*
- **humantime**: [STRING] *human readable length of audio. Will be hh:mm:ss if longer than 1 hour, otherwise mm:ss.*

## Running

To build and run this service for yourself, a number of environment variables need to be set. These can be set by including a `.env` file in the root of the project directory.

### Required

**AWS_ACCESS_KEY_ID**
- The access key ID for the user with Amazon DynamoDB/S3 read/write permissions

**AWS_SECRET_ACCESS_KEY**
- The corresponding secret access key for the `AWS_ACCESS_KEY_ID`

**AWS_AUDIO_BUCKET**
- The name of the S3 bucket that the audio versions of FT articles can be found in.

**AWS_AUDIO_METADATA_TABLE**
- The name of the DynamoDB table that contains the metadata for the audio versions of FT articles.

**CACHE_PURGE_KEY**
- The value that the `purgeToken` needs to be to trigger a cache purge at the `/purge` endpoint.

### Optional

**SL_MEDIA_FORMAT**
- The expected media format for the audio files. Defaults to `.mp3` if not included

**AWS_REGION**
- The region code for the AWS services being utilised. Defaults to `us-west-2` if not included.

**HOLDING_TIME**
- How long a request for an audio file lookup should be held before returning an error/result. A request will only be held if the first check for an audio file is underway. 

## Additional info

This service has `/__gtg` and `/__health` endpoints.
