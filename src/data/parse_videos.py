import json
import re
from datetime import datetime
import glob
import os

def parse_timestamp(timestamp):
    """Convert timestamp string (H:MM:SS or MM:SS) to seconds"""
    parts = list(map(int, timestamp.split(':')))
    if len(parts) == 3:
        hours, minutes, seconds = parts
        return hours * 3600 + minutes * 60 + seconds
    elif len(parts) == 2:
        minutes, seconds = parts
        return minutes * 60 + seconds
    else:
        # Handle unexpected format, perhaps raise an error or return 0
        raise ValueError(f"Timestamp format not recognized: {timestamp}")

def parse_video_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Get video metadata from first 4 lines
    video_url = lines[0].strip()
    video_title = lines[1].strip()
    channel_name = lines[2].strip()
    subscribers = lines[3].strip()
    
    # Initialize variables for transcript parsing
    current_timestamp = None
    current_text = []
    segments = []
    
    # Process remaining lines (skip first 5 lines - 4 metadata + 1 empty line)
    for line in lines[5:]:
        line = line.strip()
        if not line:
            continue
            
        # Check if line is a timestamp
        if re.match(r'^\d+:\d+(:\d+)?$', line):
            # If we have a previous segment, save it
            if current_timestamp is not None and current_text:
                segments.append({
                    'start': current_timestamp,
                    'text': ' '.join(current_text)
                })
            
            # Start new segment
            current_timestamp = parse_timestamp(line)
            current_text = []
        else:
            # Add text to current segment
            current_text.append(line)
    
    # Add the last segment
    if current_timestamp is not None and current_text:
        segments.append({
            'start': current_timestamp,
            'text': ' '.join(current_text)
        })
    
    # Calculate durations
    for i in range(len(segments)):
        if i < len(segments) - 1:
            segments[i]['duration'] = segments[i + 1]['start'] - segments[i]['start']
        else:
            # For the last segment, assume 5 seconds duration
            segments[i]['duration'] = 5
    
    # Extract video ID from URL
    video_id = video_url.split('v=')[-1] if 'v=' in video_url else video_url.split('/')[-1]
    
    # Create the transcript object
    transcript = {
        'id': os.path.splitext(os.path.basename(file_path))[0],  # Use filename as ID
        'title': video_title,
        'videoId': video_id,
        'channelName': channel_name,
        'subscribers': subscribers,
        'content': segments
    }
    
    return transcript

def main():
    # Get all video files
    video_files = glob.glob('./video*.txt')
    
    # Parse all video files
    transcripts = []
    for video_file in sorted(video_files):
        transcript = parse_video_file(video_file)
        transcripts.append(transcript)
    
    # Write to JSON file
    with open('./transcripts.json', 'w', encoding='utf-8') as f:
        json.dump(transcripts, f, indent=2, ensure_ascii=False)

if __name__ == '__main__':
    main() 