import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class VoiceMessageBubble extends StatefulWidget {
  final String audioUrl;
  final bool isMe;

  const VoiceMessageBubble({
    super.key,
    required this.audioUrl,
    required this.isMe,
  });

  @override
  State<VoiceMessageBubble> createState() => _VoiceMessageBubbleState();
}

class _VoiceMessageBubbleState extends State<VoiceMessageBubble> {
  final AudioPlayer _player = AudioPlayer();
  bool _isPlaying = false;
  Duration _duration = Duration.zero;
  Duration _position = Duration.zero;

  @override
  void initState() {
    super.initState();
    _player.onPlayerStateChanged.listen((state) {
      if (mounted) {
        setState(() {
          _isPlaying = state == PlayerState.playing;
        });
      }
    });

    _player.onDurationChanged.listen((newDuration) {
      if (mounted) {
        setState(() {
          _duration = newDuration;
        });
      }
    });

    _player.onPositionChanged.listen((newPosition) {
      if (mounted) {
        setState(() {
          _position = newPosition;
        });
      }
    });
  }

  @override
  void dispose() {
    _player.dispose();
    super.dispose();
  }

  Future<void> _togglePlay() async {
    if (_isPlaying) {
      await _player.pause();
    } else {
      await _player.play(UrlSource(widget.audioUrl));
    }
  }

  String _formatDuration(Duration d) {
    String twoDigits(int n) => n.toString().padLeft(2, "0");
    String twoDigitSeconds = twoDigits(d.inSeconds.remainder(60));
    return "${d.inMinutes}:$twoDigitSeconds";
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bubbleColor = widget.isMe
        ? (isDark ? Colors.blue[900] : Colors.blue[100])
        : (isDark ? const Color(0xFF1E293B) : Colors.white);

    final textColor = widget.isMe
        ? Colors.blue[900]
        : (isDark ? Colors.grey[300] : Colors.grey[800]);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: bubbleColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: widget.isMe
              ? Colors.blue.withValues(alpha: 0.3)
              : (isDark ? Colors.white10 : Colors.grey[300]!),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          GestureDetector(
            onTap: _togglePlay,
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: widget.isMe
                    ? Colors.blue
                    : (isDark ? Colors.grey[700] : Colors.grey[200]),
                shape: BoxShape.circle,
              ),
              child: Icon(
                _isPlaying ? Icons.pause : Icons.play_arrow,
                color: widget.isMe
                    ? Colors.white
                    : (isDark ? Colors.white : Colors.black),
                size: 20,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Voice Message",
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: textColor,
                ),
              ),
              const SizedBox(height: 4),
              SizedBox(
                width: 120,
                child: LinearProgressIndicator(
                  value: _duration.inSeconds > 0
                      ? _position.inSeconds / _duration.inSeconds
                      : 0.0,
                  backgroundColor: widget.isMe
                      ? Colors.blue.withValues(alpha: 0.2)
                      : Colors.grey.withValues(alpha: 0.3),
                  valueColor: AlwaysStoppedAnimation<Color>(
                    widget.isMe
                        ? Colors.blue
                        : (isDark ? Colors.greenAccent : Colors.green),
                  ),
                  minHeight: 4,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                "${_formatDuration(_position)} / ${_formatDuration(_duration)}",
                style: GoogleFonts.inter(
                  fontSize: 10,
                  color: widget.isMe ? Colors.blue[800] : Colors.grey[500],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
