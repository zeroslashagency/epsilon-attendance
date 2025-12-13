import 'package:flutter/material.dart';
import 'dart:math' as math;

class PremiumLoadingIndicator extends StatefulWidget {
  final double size;
  final Color startColor;
  final Color endColor;

  const PremiumLoadingIndicator({
    super.key,
    this.size = 60,
    this.startColor = Colors.blue,
    this.endColor = Colors.green,
  });

  @override
  State<PremiumLoadingIndicator> createState() =>
      _PremiumLoadingIndicatorState();
}

class _PremiumLoadingIndicatorState extends State<PremiumLoadingIndicator>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: widget.size,
      height: widget.size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Gradient Arc Spinner
          AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              return Transform.rotate(
                angle: _controller.value * 2 * math.pi,
                child: CustomPaint(
                  size: Size(widget.size, widget.size),
                  painter: _GradientArcPainter(
                    startColor: widget.startColor,
                    endColor: widget.endColor,
                    width: 4.0,
                  ),
                ),
              );
            },
          ),

          // Running Figure (Icon) - Pulsing
          AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              // Creating a running loop effect (bounce)
              final bounce =
                  math.sin(_controller.value * 4 * math.pi).abs() *
                  0.2; // 0.0 to 0.2
              return Transform.translate(
                offset: Offset(0, -bounce * 10), // Bounce up and down
                child: child,
              );
            },
            child: Icon(
              Icons.directions_run,
              color: widget.endColor,
              size: widget.size * 0.5,
            ),
          ),
        ],
      ),
    );
  }
}

class _GradientArcPainter extends CustomPainter {
  final Color startColor;
  final Color endColor;
  final double width;

  _GradientArcPainter({
    required this.startColor,
    required this.endColor,
    required this.width,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Rect.fromLTWH(0, 0, size.width, size.height);
    final gradient = SweepGradient(
      startAngle: 0.0,
      endAngle: math.pi * 1.5, // 270 degrees arc
      colors: [startColor.withValues(alpha: 0.0), startColor, endColor],
      stops: const [0.0, 0.5, 1.0],
      tileMode: TileMode.repeated,
    );

    final paint = Paint()
      ..shader = gradient.createShader(rect)
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = width;

    // Draw arc
    canvas.drawArc(rect.deflate(width / 2), 0, math.pi * 1.5, false, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
