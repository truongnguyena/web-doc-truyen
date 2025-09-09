package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var (
	db  *gorm.DB
	rdb *redis.Client
)

type Manga struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Author      string    `json:"author"`
	Genres      []Genre   `json:"genres" gorm:"many2many:manga_genres;"`
	Chapters    []Chapter `json:"chapters"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Genre struct {
	ID    uint   `json:"id" gorm:"primaryKey"`
	Name  string `json:"name"`
	Manga []Manga `json:"manga" gorm:"many2many:manga_genres;"`
}

type Chapter struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	MangaID   uint      `json:"manga_id"`
	Number    float64   `json:"number"`
	Title     string    `json:"title"`
	Pages     []Page    `json:"pages"`
	CreatedAt time.Time `json:"created_at"`
}

type Page struct {
	ID        uint   `json:"id" gorm:"primaryKey"`
	ChapterID uint   `json:"chapter_id"`
	Number    int    `json:"number"`
	ImageURL  string `json:"image_url"`
}

func main() {
	// Kết nối Database
	initDB()
	
	// Kết nối Redis cho cache
	initRedis()

	// Khởi tạo Gin router
	r := gin.Default()

	// CORS middleware
	r.Use(corsMiddleware())

	// API Routes
	api := r.Group("/api/v1")
	{
		// Manga routes
		manga := api.Group("/manga")
		{
			manga.GET("", listManga)
			manga.POST("", createManga)
			manga.GET("/:id", getManga)
			manga.PUT("/:id", updateManga)
			manga.DELETE("/:id", deleteManga)
			
			// Chapter routes
			manga.GET("/:id/chapters", listChapters)
			manga.POST("/:id/chapters", createChapter)
		}

		// Genre routes
		genres := api.Group("/genres")
		{
			genres.GET("", listGenres)
			genres.POST("", createGenre)
		}

		// Search routes
		api.GET("/search", searchManga)
	}

	log.Fatal(r.Run(":8080"))
}

func initDB() {
	var err error
	dsn := "host=localhost user=postgres password=postgres dbname=manga port=5432"
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto Migrate
	db.AutoMigrate(&Manga{}, &Genre{}, &Chapter{}, &Page{})
}

func initRedis() {
	rdb = redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
	})
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusOK)
			return
		}

		c.Next()
	}
}

// API Handlers
func listManga(c *gin.Context) {
	var mangas []Manga
	result := db.Preload("Genres").Find(&mangas)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, mangas)
}

func getManga(c *gin.Context) {
	id := c.Param("id")
	
	// Try get from cache first
	val, err := rdb.Get(context.Background(), "manga:"+id).Result()
	if err == nil {
		c.Data(http.StatusOK, "application/json", []byte(val))
		return
	}

	var manga Manga
	result := db.Preload("Genres").Preload("Chapters.Pages").First(&manga, id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Manga not found"})
		return
	}

	// Cache the result
	jsonData, _ := c.Get("application/json")
	rdb.Set(context.Background(), "manga:"+id, jsonData, 1*time.Hour)

	c.JSON(http.StatusOK, manga)
}

func createManga(c *gin.Context) {
	var manga Manga
	if err := c.ShouldBindJSON(&manga); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := db.Create(&manga)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusCreated, manga)
}

func updateManga(c *gin.Context) {
	id := c.Param("id")
	var manga Manga
	
	if err := db.First(&manga, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Manga not found"})
		return
	}

	if err := c.ShouldBindJSON(&manga); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db.Save(&manga)
	
	// Invalidate cache
	rdb.Del(context.Background(), "manga:"+id)

	c.JSON(http.StatusOK, manga)
}

func deleteManga(c *gin.Context) {
	id := c.Param("id")
	result := db.Delete(&Manga{}, id)
	
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	// Invalidate cache
	rdb.Del(context.Background(), "manga:"+id)

	c.Status(http.StatusNoContent)
}

func listChapters(c *gin.Context) {
	mangaID := c.Param("id")
	var chapters []Chapter
	
	result := db.Where("manga_id = ?", mangaID).Preload("Pages").Find(&chapters)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, chapters)
}

func createChapter(c *gin.Context) {
	var chapter Chapter
	if err := c.ShouldBindJSON(&chapter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := db.Create(&chapter)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusCreated, chapter)
}

func listGenres(c *gin.Context) {
	var genres []Genre
	result := db.Find(&genres)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, genres)
}

func createGenre(c *gin.Context) {
	var genre Genre
	if err := c.ShouldBindJSON(&genre); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := db.Create(&genre)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusCreated, genre)
}

func searchManga(c *gin.Context) {
	query := c.Query("q")
	var mangas []Manga

	result := db.Where("title ILIKE ? OR description ILIKE ?", "%"+query+"%", "%"+query+"%").
		Preload("Genres").
		Find(&mangas)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, mangas)
}
