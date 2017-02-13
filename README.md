# Audio Available
Do we have an audio file for an article?

Currently hosted on [Heroku](https://ftlabs-audio-available.herokuapp.com).

## What does it do?

audio-available is the place to find out whether or not there is an audio version of an article on FT.com.

## Why does it exist?

At the moment, audio content doesn't have a proper, permanent place to live at the FT. Over the last little while, FT Labs has been exploring different applications of audio across the FT's content. Having a simple service that can tell us whether or not a given article has an audio file, and where we can find it, seemed like a pretty useful thing to have.

## Usage

To check for the existence of an audio file for an article, you can hit the `/check/:UUID`. 

You can pass any FT content UUID to check the availability, location and basic information of an audio file.

The `UUID` must be a valid v4 UUID. 

**Example**

`https://ftlabs-audio-available.herokuapp.com/check/0e69c5a4-a4cd-11e6-8898-79a99e2a4de6`

**Response**

*The HTTP status code for any lookup will be `200`, even if a file does not exist. A status code of `420` will be returned if the request is improper (invalid UUID, for example).*

```
// If file exists...

{
	haveFile: true,
	url: "[ABSOLUTE PATH TO AUDIO FILE]",
	size: "2744769",
	duration: {
		milliseconds: 343040,
		seconds: "343.04",
		humantime: "05:43"
	}
}

// If file does not exist...

{
	haveFile: false
}

```

### Response properties

**haveFile**: [BOOLEAN] true *or* false

*The following properties will only appear if there is a valid audio file*

**url**: [STRING] 

**size**: [NUMBER] *size of available audio file in bytes*

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

### Optional

**SL_MEDIA_FORMAT**
- The expected media format for the audio files. Defaults to `.mp3` if not included

**AWS_REGION**
- The region code for the AWS services being utilised. Defaults to `us-west-2` if not included.